export function demo(){
 const definitions=[
 ['sprites/actor_01.svg','A weary explorer wearing a backpack and carrying a lantern through underground tunnels.','#d6a344'],
 ['sprites/prop_07.svg','An ancient sealed treasure chest with a gold lock, holding hidden riches.','#ab744b'],
 ['sprites/fx_03.svg','A burst of flame and glowing embers from a fiery explosion.','#d9653d'],
 ['sprites/env_12.svg','A tall evergreen tree with snow on its branches in a winter forest.','#6d8c75'],
 ['sprites/item_04.svg','A glass vial filled with red restorative liquid that restores lost health.','#a45664'],
 ['sprites/prop_09.svg','A wooden sailing vessel crossing a blue ocean under full sails.','#557e9a'],
 ['sprites/env_18.svg','A stone arch doorway leading into an abandoned castle.','#8b8679']];
 const files=definitions.map(([path,description,color],i)=>{const data=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect x="8" y="8" width="48" height="48" rx="${i+3}" fill="${color}"/><text x="32" y="39" text-anchor="middle" fill="white" font-family="monospace" font-size="20">${i+1}</text></svg>`;const blob=new Blob([data]);return {path,size:blob.size,arrayBuffer:()=>blob.arrayBuffer()};});
 files.push({...files[1],path:'sprites/prop_07_copy.svg'});
 const empty=new Blob([]);files.push({path:'audio/unused.tmp',size:0,arrayBuffer:()=>empty.arrayBuffer()});
 const assets=definitions.map(([path,description],i)=>({path,description,creator:'Synthetic demo',license:'CC0-1.0',source:'Original geometric fixture created for this prototype',...(i===2?{creator:'',source:''}:{}),...(i===0?{references:['sprites/lantern_missing.svg']}: {})}));
 return {files,index:{assets}};
}
