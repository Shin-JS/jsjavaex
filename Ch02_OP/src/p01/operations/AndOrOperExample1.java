package p01.operations;
/**
 * &(AND),|(OR), &&,|| 
 * *.OR연산
 * -.|: 왼쪽피연산자의 값이 true이더라도 오른쪽 피연산자의 값을 연산 후 |연산을 함 
 * -.||: 왼쪽피연산자가 true이면 or연산의 특성상 오른쪽피연산자의 true/false여부와 상관없이 true이므로 연산을 중단하고 다음명령 실행
 **/
public class AndOrOperExample1 {
	public static void main(String[] args) {
		int num1 = 0;
		int num2 = 0;
		
		if(++num1>0|++num2>0) {
			System.out.println("num1이나 num2가 0보다 크다");
		}
		System.out.println("num1="+num1);
		System.out.println("num2="+num2);
		num1 = 0;
		num2 = 0;
		if (++num1 > 0 || ++num2 > 0) {
			System.out.println("num1이나 num2가 0보다 큼");
		}
		System.out.println("num1="+num1);
		System.out.println("num2="+num2);
		
		int num3 = 0;
		int num4 = 0;
		if(++num3 <0 & ++num4 < 0) {
			System.out.println("둘 다 0보다 작음");
		}else {
			System.out.println("둘 다 0보다 큼");
		}
		System.out.println("num3 = "+num3);
		System.out.println("num4 = "+num4);
		
	}
}
