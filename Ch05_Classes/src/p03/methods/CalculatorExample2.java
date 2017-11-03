package p03.methods;
/** [메소드(메소드의 오버로딩)]
 * 
 **/
public class CalculatorExample2 {
	public static void main(String[] args) {
		Calculator3 myCal = new Calculator3();
		
		//정사각형의 넓이
		double result1 = myCal.areaRectagle(10); //동일 메소드명(int)
		//직사각형의 넓이
		double result2 = myCal.areaRectangle(10, 20); //동일 메소드명(int, int)
		
		//결과 출력
		System.out.println("정사각형의 넓이: " + result1+"cm²");
		System.out.println("직사각형의 넓이: " + result2+"cm²");
	}
}
