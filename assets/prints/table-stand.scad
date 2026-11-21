// Upright sign holder. Units: millimetres. Slot for a paper or thin card insert.
$fn=64;
width=76; depth=32; height=23; slot=1.4;
difference(){
  intersection(){
    linear_extrude(height=height)
      offset(r=4) square([width-8,depth-8],center=true);
    rotate([0,90,0]) resize([height*2,depth,width+2]) cylinder(d=1,h=1,center=true);
  }
  translate([0,1.8,16]) rotate([-10,0,0]) cube([width+3,slot,height],center=true);
  for(x=[-32:3:32])translate([x,0,-.2]) scale([.56,1,1]) difference(){
    rotate([0,90,0]) resize([height*2+.8,depth+.8,1.7]) cylinder(d=1,h=1,center=true);
    rotate([0,90,0]) resize([height*2-1.25,depth-1.25,2]) cylinder(d=1,h=1,center=true);
  }
}
