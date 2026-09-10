import csv, math, statistics as st
from collections import defaultdict

rows=[]
with open(r"C:\Users\sidda\Desktop\hollywood_2024_model.csv", newline='', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if not r.get('title'): continue
        def num(k):
            v=r.get(k,'')
            try: return float(v)
            except: return None
        rows.append({
            'title':r['title'],
            'q':num('release_quarter'),
            'lb':num('log_budget'),'lr':num('log_revenue'),
            'rt':num('runtime'),'cert':(r.get('certification_us') or '').strip(),
            'genre':(r.get('main_genre') or '').strip(),
            'seq':num('is_sequel'),'adapt':num('is_adaptation'),
            'lv':num('log_views'),'ll':num('log_likes'),
        })
n=len(rows); print("N =",n)

def col(k): return [r[k] for r in rows if r[k] is not None]
def pairs(a,b):
    xs=[];ys=[]
    for r in rows:
        if r[a] is not None and r[b] is not None:
            xs.append(r[a]);ys.append(r[b])
    return xs,ys
def pearson(xs,ys):
    m=len(xs); mx=sum(xs)/m; my=sum(ys)/m
    sx=math.sqrt(sum((x-mx)**2 for x in xs)); sy=math.sqrt(sum((y-my)**2 for y in ys))
    cov=sum((x-mx)*(y-my) for x,y in zip(xs,ys))
    return cov/(sx*sy)
def corr(a,b):
    xs,ys=pairs(a,b); return pearson(xs,ys)
def partial(a,b,c):
    # partial corr of a,b controlling c
    rab=corr(a,b); rac=corr(a,c); rbc=corr(b,c)
    return (rab-rac*rbc)/math.sqrt((1-rac**2)*(1-rbc**2))

print("\n=== MAIN: attention (log_views) vs success (log_revenue) ===")
print("r(views,revenue) =",round(corr('lv','lr'),3))
print("r(views,revenue | budget) =",round(partial('lv','lr','lb'),3))

print("\n=== Correlates of log_revenue (ranked) ===")
preds={'log_budget':'lb','trailer_views':'lv','trailer_likes':'ll','runtime':'rt','is_sequel':'seq','is_adaptation':'adapt'}
cc=sorted(((name,corr(k,'lr')) for name,k in preds.items()), key=lambda t:-t[1])
for name,v in cc: print(f"  {name:16s} {v:+.3f}")
print("  views|budget (partial):", round(partial('lv','lr','lb'),3))

print("\n=== Sequels vs Originals ===")
for label,flag in [('Sequel',1.0),('Original',0.0)]:
    sub=[r for r in rows if r['seq']==flag]
    mv=st.mean([r['lv'] for r in sub if r['lv'] is not None])
    mr=st.mean([r['lr'] for r in sub if r['lr'] is not None])
    roi=st.mean([math.exp(r['lr']-r['lb']) for r in sub if r['lr'] and r['lb']])
    print(f"  {label:9s} n={len(sub):3d}  meanViews={math.exp(mv)/1e6:6.1f}M  meanRev=${math.exp(mr)/1e6:6.0f}M  meanROI={roi:4.2f}x")

print("\n=== By genre (n>=4) ===")
g=defaultdict(list)
for r in rows: g[r['genre']].append(r)
res=[]
for genre,sub in g.items():
    if len(sub)<4: continue
    mv=st.mean([r['lv'] for r in sub if r['lv'] is not None])
    mr=st.mean([r['lr'] for r in sub if r['lr'] is not None])
    roi=st.mean([math.exp(r['lr']-r['lb']) for r in sub if r['lr'] and r['lb']])
    res.append((genre,len(sub),math.exp(mv)/1e6,math.exp(mr)/1e6,roi))
res.sort(key=lambda t:-t[4])
print(f"  {'genre':12s} {'n':>3s} {'views(M)':>9s} {'rev($M)':>9s} {'ROI':>6s}")
for genre,c,v,rev,roi in res:
    print(f"  {genre:12s} {c:3d} {v:9.1f} {rev:9.0f} {roi:6.2f}")

print("\n=== By release quarter ===")
q=defaultdict(list)
for r in rows:
    if r['q'] is not None: q[int(r['q'])].append(r)
for k in sorted(q):
    sub=q[k]
    mv=st.mean([r['lv'] for r in sub if r['lv'] is not None])
    mr=st.mean([r['lr'] for r in sub if r['lr'] is not None])
    print(f"  Q{k} n={len(sub):3d}  meanViews={math.exp(mv)/1e6:6.1f}M  meanRev=${math.exp(mr)/1e6:5.0f}M")

print("\n=== Runtime vs revenue ===")
print("  r(runtime,revenue) =",round(corr('rt','lr'),3))
print("  r(runtime,views)   =",round(corr('rt','lv'),3))

print("\n=== Engagement: likes/views vs revenue ===")
# like ratio in log space = ll - lv ; correlate with revenue
for r in rows:
    r['like_ratio']= (r['ll']-r['lv']) if (r['ll'] is not None and r['lv'] is not None) else None
print("  r(like_ratio,revenue) =",round(corr('like_ratio','lr'),3))
print("  r(likes,revenue)      =",round(corr('ll','lr'),3))

print("\n=== Certification (n>=6) ===")
c=defaultdict(list)
for r in rows:
    if r['cert']: c[r['cert']].append(r)
for cert,sub in sorted(c.items(), key=lambda t:-len(t[1])):
    if len(sub)<6: continue
    mr=st.mean([r['lr'] for r in sub if r['lr'] is not None])
    roi=st.mean([math.exp(r['lr']-r['lb']) for r in sub if r['lr'] and r['lb']])
    print(f"  {cert:6s} n={len(sub):3d} meanRev=${math.exp(mr)/1e6:5.0f}M ROI={roi:4.2f}x")
