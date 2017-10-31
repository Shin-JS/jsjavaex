package p01.operations;
/**
 * 비트연산 -shift(<<, >>, >>>)
 *  
 **/
public class BitOperExample3 {
	public static void main(String[] args) {
		int num1 = 0xFF00FF01;
		System.out.println("num1= "+Integer.toBinaryString(num1));
		int result1 = num1<<3; //왼쪽으로 3비트 이동 빈칸은 0으로 채워짐
		int result2 = num1>>3; //오른쪽으로 3비트 이동 빈칸은 부호비트로 채워짐
		int result3 = num1>>>3; //오른쪽으로 3비트 이동 빈칸은 0으로 채워짐
		System.out.println("num1= "+Integer.toBinaryString(result1));
		System.out.println("num1= "+Integer.toBinaryString(result2));
		System.out.println("num1= "+Integer.toBinaryString(result3));
		//printf()로 출력.
		System.out.printf("%08x %n",result1);
		System.out.printf("%08x %n",result2);
		System.out.printf("%08x %n",result3);
		
	}
}
