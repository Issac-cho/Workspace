### Computer Graphics PA2
### 2019010600 조준희

### To run this file
1. Please decompress cowrollercoaster.zip
2. Run SimpleScene.py

### What I wrote
<Import>
--------------------------------------------
1. math
Math was imported to use math.tan2 and math.sqrt.
--------------------------------------------
<Global variables>
--------------------------------------------
1. cowlist
List for storing 6 specific cow2wlds.
Every click is written onMouseButton to save that point cow2wld.
It is initialized to empty list.
--------------------------------------------
2. check_drag
It is a global variable that is set to 1 if it is dragging and 0 if it is not dragging.
It is initialized to 1 to prevent cow2wld from being stored in the cowlist at the first click.
--------------------------------------------
3. is_animating
It is a global variable that is set to 1 when animation starts and 0 when animation ends.
Be reset to zero.
--------------------------------------------
4. animStartTime
It is a global variable that stores the time when animation started.
--------------------------------------------
<Functions>
--------------------------------------------
1. cal_CRScurvePos(P0, P1, P2, P3, t)
It is a function that receives four position coordinates and returns the coordinates of the point on the Catmull-Romspline curve made of the coordinates.
If t=0, return P1, and if t=1, return P2.
--------------------------------------------
2. cal_CRScurveVel(P0, P1, P2, P3, t)
Mathematically, it is a function that returns the value of calculating the result of differentiating cal_CRScurvePos for t.
Returns the tangent vector at P1 if t=0, and the tangent vector at P2 if t=1.
--------------------------------------------
3. display()
The remaining afterimages when clicked 6 times and the code for realizing the movement of the cow were added.

if is_animating == 0
Draw an afterimage of the cow on the location of the cows stored in the cowlist, and draw the cow following the mouse cursor.

if is_animating == 1
It is an animation that starts after 6 clicks.
Look at the direction in which the cow moves and moves along the Catmull_Romspline curve.
6 seconds per lap, total 3 laps.
After 18 seconds, is_animating and animStartTime are initialized to zero, and the cowlist is also initialized to an empty list.
--------------------------------------------
4. onMouseButton(window,button, state, mods)
It was determined that isDrag did not need to be 0, so the function was deleted.
It was implemented to be V_DRAG in the case of L-dragging and H_DRAG in the case of normal dragging.
If you click down, it's basically V_DRAG. I wrote the code to save the cow's location only when I click up without dragging.
If you save the cow position 6 times, is_animation is set to 1 and animation starts.

To fix the bug where the position of the cow becomes unnatural as isDrag changes to H_DRAG and V_DRAG, we put code that fixes pickInfo whenever the onMouseButton function is called.
--------------------------------------------
5. onMouseDrag(window, x, y)
When isDrag is V_DRAG, dragging is implemented to cause the cow to move vertically.
After setting the plane where ray meets as the xy plane, matrix T was modified to move only in the y-axis.
--------------------------------------------
