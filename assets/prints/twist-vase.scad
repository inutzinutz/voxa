// Dry-stem vase. Units: millimetres. Print upright.
flutes=18;
height=92;
steps=32;
n=flutes*6;
function radius(t,a)=28+5*sin(210*t-12)+1.7*cos(flutes*(a-62*t));
function ring(t,inner)=[for(j=[0:n-1]) let(a=360*j/n,r=radius(t,a)-(inner?2.2:0)) [r*cos(a),r*sin(a),height*t]];
points=concat([for(i=[0:steps]) each ring(i/steps,false)],[for(i=[0:steps]) each ring(max(.035,i/steps*.965+.035),true)]);
o=(steps+1)*n;
function band(a,b,flip)=[for(j=[0:n-1]) let(k=(j+1)%n) each (flip?[[a+j,b+j,b+k],[a+j,b+k,a+k]]:[[a+j,a+k,b+k],[a+j,b+k,b+j]])];
faces=concat([for(i=[0:steps-1]) each band(i*n,(i+1)*n,true)],[for(i=[0:steps-1]) each band(o+i*n,o+(i+1)*n,false)],band(steps*n,o+steps*n,true),[[for(j=[0:n-1])j]],[[for(j=[n-1:-1:0]) o+j]]);
polyhedron(points=points,faces=faces,convexity=10);
