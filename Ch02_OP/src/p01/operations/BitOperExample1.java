package p01.operations;
/**
 * 비트연산자 (&(AND),|(OR),^(Exclusive-OR,XOR),~) 
 **/
public class BitOperExample1 {
	public static void main(String[] args) {
		int num1 = 0xFFFF0000;
		int num2 = 0xFF00FF00;
		System.out.println("num1 = "+num1);
		System.out.println("num2 = "+num2);
		System.out.println(Integer.toBinaryString(num1));
		System.out.println(Integer.toBinaryString(num2));
		int result1 = num1&num2;
		int result2 = num1|num2;
		int result3 = num1^num2;
		int result4 = ~num1;
		
		//printf()문 문장을 출력시 format을 사용, 
		System.out.printf("%08x %n",result1);// printf("%0yx",변수)→변수의 값이 y자리의 16진수로 표시
		System.out.printf("%08x %n",result2);
		System.out.printf("%08x %n",result3);
		System.out.printf("%08x %n",result4);
		System.out.println(Integer.toBinaryString(result1));
		System.out.println(Integer.toBinaryString(result2));
		System.out.println(Integer.toBinaryString(result3));
		System.out.println(Integer.toBinaryString(result4));
		
	}
}
