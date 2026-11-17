// Right-handed axes: X from machine end to basin (right to left from front), Y up, Z to wall.
export const SCENE_SCALE=Object.freeze([1,1,1]);
export const FRONT_DESCRIPTION='Спереди: раковина слева · машина справа';
export function frontX(x,width=0,total=1200){return total-x-width;}
export function viewPose(view,H=900){
 const positions={perspective:[1950,1450,-1950],front:[600,560,-1850],side:[3000,530,270],top:[600,2400,299],joint:[980,H+50,790],foot:[890,250,-150],frameJoint:[430,H-85,-145],lower:[950,500,210]};
 const targets={perspective:[600,490,220],front:[600,550,230],side:[600,530,270],top:[600,350,300],joint:[700,H-90,555],foot:[700,130,62.5],frameJoint:[685,H-55,85],lower:[700,280,62.5]};
 return{position:[...positions[view]],target:[...targets[view]]};
}
