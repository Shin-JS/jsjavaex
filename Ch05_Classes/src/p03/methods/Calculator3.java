package p03.methods;
/** [메소드(메소드의 오버로딩)]
 * 
 **/
public class Calculator3 {
	//정사각형의 넓이
	double areaRectagle(double width) { //(double)
				return width*width; 
	}
	//직사각형의 넓이
	double areaRectangle(double width, double height) {//(double,double)
		return width*height;
	}
}
