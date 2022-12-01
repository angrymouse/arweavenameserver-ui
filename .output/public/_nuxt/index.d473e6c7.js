import{j as m,r as N,w as d,b as c,e as s,u as w,F as b,f as y,m as p,q as u,p as n,s as A,o,c as k,t as S}from"./entry.f22023f8.js";import{A as j,_ as B}from"./ardb.bec4bd6a.js";const C={class:"h-full w-full flex flex-col items-center justify-center"},D=s("h1",{class:"text-2xl mt-4"},"Welcome to Arweave Nameserver Portal!",-1),M={class:"bg-neutral lg:w-1/2 xl:w-1/4 w-3/4 p-4 mt-4 flex flex-col items-center justify-center"},z=s("p",{class:"text-lg"},"Your names:",-1),E={key:0,class:"flex flex-col items-center w-full"},T={key:1,class:"p-3 mt-2 w-full text-center rounded flex flex-col text-gray-400 border-spacing-2 border-2 border-dashed border-gray-500"},V=s("div",{class:"text-center"},[n("Made with \u2764\uFE0F by "),s("a",{class:"link",href:"https://github.com/angrymouse"},"Angrymouse"),n(" with big support from "),s("a",{class:"link",href:"https://arweave.org"},"Arweave"),n(" and "),s("a",{class:"link",href:"https://stargaze.zone"},"Stargaze")],-1),U={__name:"index",async setup(F){let e,l;const v=m("arweave",()=>{j.init({host:"arweave.net",port:443,protocol:"https",timeout:6e4,logging:!1})}).value,h=m("ardb",()=>new B(v.value));let g=m("wallet",()=>null).value,f=h.value,i=N([]),x=([e,l]=d(async()=>f.search("transactions").appName("Arweave-Nameserver").tags([{name:"App-Name",values:["Arweave-Nameserver"]},{name:"Manager",values:[([e,l]=d(()=>g.getActiveAddress()),e=await e,l(),e)]}]).exclude(["anchor"]).findAll()),e=await e,l(),e);return i.value=([e,l]=d(async()=>Promise.all(x.map(async a=>{let _=await fetch("https://arweave.net/"+a.id).then(t=>t.json());console.log(a.id);let r=await f.search("transactions").sort("HEIGHT_DESC").from(_.managers).appName("Arweave-Nameserver").tags([{name:"Action",values:"UpdateName"},{name:"Manager-TX",values:[a.id]}]).exclude("anchor").limit(1).findOne()||a;return{id:a.id,domainName:r.tags.find(t=>t.name=="Domain-Name")?r.tags.find(t=>t.name=="Domain-Name").value:null}}))),e=await e,l(),e).filter(a=>a.domainName!=null),(a,_)=>{const r=A;return o(),c("div",C,[D,s("div",M,[z,w(i).length>0?(o(),c("div",E,[(o(!0),c(b,null,y(w(i),t=>(o(),k(r,{class:"my-2 p-4 bg-base-100 rounded-lg text-center w-full lg:w-1/2",to:"/manage/#"+t.id},{default:u(()=>[n(S(t.domainName),1)]),_:2},1032,["to"]))),256)),p(r,{to:"/create",class:"btn btn-outline mt-2 w-full"},{default:u(()=>[n("Add new name")]),_:1})])):(o(),c("div",T,[n(" You don't have any names yet. "),p(r,{to:"/create",class:"btn btn-outline mt-2"},{default:u(()=>[n("Add one!")]),_:1})]))]),V])}}};export{U as default};
