import csv, math, statistics as st, json
from collections import defaultdict

rows=[]
with open(r"C:\Users\sidda\Desktop\hollywood_2024_model.csv", newline='', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if not r.get('title'): continue
        def num(k):
            try: return float(r[k])
            except: return None
        rows.append({'title':r['title'],'q':num('release_quarter'),'lb':num('log_budget'),
            'lr':num('log_revenue'),'rt':num('runtime'),'cert':(r.get('certification_us') or '').strip(),
            'genre':(r.get('main_genre') or '').strip(),'seq':num('is_sequel'),
            'adapt':num('is_adaptation'),'lv':num('log_views'),'ll':num('log_likes')})

def pearson(xs,ys):
    m=len(xs);mx=sum(xs)/m;my=sum(ys)/m
    sx=math.sqrt(sum((x-mx)**2 for x in xs));sy=math.sqrt(sum((y-my)**2 for y in ys))
    return sum((x-mx)*(y-my) for x,y in zip(xs,ys))/(sx*sy)
def pairs(a,b):
    xs=[];ys=[]
    for r in rows:
        if r[a] is not None and r[b] is not None: xs.append(r[a]);ys.append(r[b])
    return xs,ys
def corr(a,b):
    xs,ys=pairs(a,b);return pearson(xs,ys)
def partial(a,b,c):
    rab,rac,rbc=corr(a,b),corr(a,c),corr(b,c)
    return (rab-rac*rbc)/math.sqrt((1-rac**2)*(1-rbc**2))

# ---- MAIN scatter: views vs revenue ----
xs,ys=pairs('lv','lr')
r_main=pearson(xs,ys)
mx=sum(xs)/len(xs);my=sum(ys)/len(ys)
sx=math.sqrt(sum((x-mx)**2 for x in xs));sy=math.sqrt(sum((y-my)**2 for y in ys))
slope=r_main*sy/sx; intercept=my-slope*mx
xmin,xmax=min(xs),max(xs)
scatter=[{"x":round(r['lv'],2),"y":round(r['lr'],2),"seq":int(r['seq']),
          "title":r['title'],"genre":r['genre'],
          "views":round(math.exp(r['lv'])/1e6,1),"rev":round(math.exp(r['lr'])/1e6,1)}
         for r in rows if r['lv'] is not None and r['lr'] is not None]
line=[{"x":round(xmin,2),"y":round(intercept+slope*xmin,2)},
      {"x":round(xmax,2),"y":round(intercept+slope*xmax,2)}]

# ---- 1. correlates ----
preds=[('Adaptation','adapt'),('Runtime','rt'),('Is sequel','seq'),
       ('Trailer likes','ll'),('Trailer views','lv'),('Prod. budget','lb')]
corrs=[{"label":n,"value":round(corr(k,'lr'),3)} for n,k in preds]
corrs.append({"label":"Views | budget","value":round(partial('lv','lr','lb'),3),"partial":True})
corrs.sort(key=lambda d:d["value"])

# ---- 2. sequel premium ----
def agg(sub):
    mv=st.mean([r['lv'] for r in sub if r['lv'] is not None])
    mr=st.mean([r['lr'] for r in sub if r['lr'] is not None])
    roi=st.mean([math.exp(r['lr']-r['lb']) for r in sub if r['lr'] and r['lb']])
    return round(math.exp(mv)/1e6,1),round(math.exp(mr)/1e6,0),round(roi,2)
seq_sub=[r for r in rows if r['seq']==1.0]; orig_sub=[r for r in rows if r['seq']==0.0]
sv,sr,sroi=agg(seq_sub); ov,orr,oroi=agg(orig_sub)
sequel=[{"group":"Originals","n":len(orig_sub),"views":ov,"rev":orr,"roi":oroi},
        {"group":"Sequels","n":len(seq_sub),"views":sv,"rev":sr,"roi":sroi}]

# ---- 3. genre views vs roi ----
g=defaultdict(list)
for r in rows: g[r['genre']].append(r)
genre=[]
for gn,sub in g.items():
    if len(sub)<5: continue
    v,rev,roi=agg(sub)
    genre.append({"genre":gn,"n":len(sub),"views":v,"roi":roi})
genre.sort(key=lambda d:-d["views"])

# ---- 4. budget quartile trap ----
srt=sorted([r for r in rows if r['lb'] is not None],key=lambda r:r['lb'])
n=len(srt);qn=n//4
binlabels=["micro","low","mid","tentpole"]
budget=[]
for i in range(4):
    seg=srt[i*qn:(i+1)*qn] if i<3 else srt[3*qn:]
    medb=st.median([r['lb'] for r in seg])
    mv=st.mean([r['lv'] for r in seg if r['lv'] is not None])
    roi=st.mean([math.exp(r['lr']-r['lb']) for r in seg if r['lr'] and r['lb']])
    budget.append({"bin":binlabels[i],"budget":round(math.exp(medb)/1e6),
                   "views":round(math.exp(mv)/1e6,1),"roi":round(roi,2)})

out={"main":{"r":round(r_main,2),"rPartial":round(partial('lv','lr','lb'),2),
             "points":scatter,"line":line},
     "correlates":corrs,"sequel":sequel,"genre":genre,"budget":budget}
print(json.dumps(out))
