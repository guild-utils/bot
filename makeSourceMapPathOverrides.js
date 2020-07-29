const {promises:fs}=require("fs");
const path=require("path");
async function main(){
  const children=await fs.readdir("./packages/");
  const packages=(await Promise.all(children.map(e=>path.join("packages/",e)).flatMap(async e=>(await fs.readdir(e)).map(e2=>path.join(e,e2))))).flat(1).map(e=>e.replace(/\\/g,"/"));
  const map=packages.reduce((a,e)=>{
    a["/"+e+"/*"]="${workspaceFolder}/"+e+"/*";
    return a;
  },{});
  console.log(JSON.stringify(map,undefined,2));
}
main()