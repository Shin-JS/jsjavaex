package p01.operations;
/**
 * 비교연산자(==,!=,>,<,>=,<=) 
 * -.연산의 결과가 true/false로 나온다.
 **/
public class OperExample4 {
	public static void main(String[] args) {
		//수치연산
		System.out.println(4<3); //리터럴 < 리터럴 → true/false
		System.out.println(10>20.0); //리터럴 > 리터럴 → true/false
		System.out.println(12.5f<=11); //리터럴 <=리터럴 → true/false
		System.out.println(7>=7); //리터럴>=리터럴 → true/false
		
		//비교연산자 (==)
		int num1 = 5; //리터럴5
		int num2 = 2 + 3; //리터럴 2+3 연산의 결과가 num2에 대입
		if (num1==num2) { //if내의 연산(==)결과에 따라 다른값 출력
			System.out.println("num1과 num2의 값은 동일함");
		}else {
			System.out.println("num1과 num2의 값은 다름");
		}
		
		if ((num1!=num2)==false) {
			System.out.println("num1과 num2는 다르다고 할 수 없다.");
		}
		
		double num3 = 1.1 + 2.2;
		double num4 = 3.3;
		if (num3==num4) {
			System.out.println("같다");  //if문의 {}블럭내에 명령문(;)이 하나만 있으면 {}생략가능.
		}else {
			 System.out.println("다르다");
		}
		
		int a = 3, b = 4, c = 3, d = 5;
		
		//연산순서 ----->
		//Java 비교연산자의 연산순위에 의해 연산	
		if((a==2|a==c)&!(c>d)&(1==b^c!=d)) {
			System.out.println("true");
		}else {
			System.out.println("false");
		}
		
		
	}
}
