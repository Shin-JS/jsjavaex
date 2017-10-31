package p01.operations;
/**
 * 비트연산 
 * Java에서 shift연산(<<)이 이루어질때
 * 데이터타입보다 큰 자리 만큼의 이동시는
 * (이동숫자%데이터타입의비트수) 의 값만 이동 
 **/
public class BitOperExample4 {
	public static void main(String[] args) {
		int num1 = 0xFFFFFFFE;
		System.out.println("num1 = "+Integer.toBinaryString(num1));
		int num2 = num1 << 30;
		int num3 = num1 << 31;
		int num4 = num1 << 32;
		int num5 = num1 << 33;
		int num6 = num1 << 34;
		System.out.println("num2 = "+Integer.toBinaryString(num2));
		System.out.println("num3 = "+Integer.toBinaryString(num3));
		System.out.println("num4 = "+Integer.toBinaryString(num4));
		System.out.println("num5 = "+Integer.toBinaryString(num5));
		System.out.println("num6 = "+Integer.toBinaryString(num6));
		
		//printf()
		System.out.printf("%08x %n",num1);
		System.out.printf("%08x %n",num2);
		System.out.printf("%08x %n",num3);
		System.out.printf("%08x %n",num4);
		System.out.printf("%08x %n",num5);
		System.out.printf("%08x %n",num6);
		
		
	}
}
