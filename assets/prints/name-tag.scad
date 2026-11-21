// Units: millimetres. Change the name then render (F6) and export STL.
label = "MILO";
$fn = 72;
height = 14;
length = max(43, len(label)*8.2 + 13);
union() {
  linear_extrude(height=2.8)
    difference() {
      hull() for (x=[0,length-height]) translate([x,0]) circle(d=height);
      translate([-1.4,0]) circle(d=4.3);
    }
  translate([length/2-3,-.1,2.75])
    linear_extrude(height=.95)
      text(label,size=7.4,font="DejaVu Sans:style=Bold",halign="center",valign="center");
}
