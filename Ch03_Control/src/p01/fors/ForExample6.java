package p01.fors;
/**
 * for 
 **/
public class ForExample6 {
	public static void main(String[] args) {
		//2개의 주사위를 10번 던져서 두개의 합을 구하는 program, random() method 사용
		for (int i = 1 ; i <= 10; i++) {
		int num1 = (int)(Math.random() * 6) + 1;
		int num2 = (int)(Math.random() * 6) + 1;
		System.out.println("num1 = " + num1);
		System.out.println("num2 = " + num2);
		System.out.println("num1 + num2 = " + (num1 + num2));
		}
		//두수의 합이 6일때만 출력되도록 수정.
		int k = 0;
		for (int j = 1 ; j <= 10; j++) {
			int num3 = (int)(Math.random() * 6) + 1;
			int num4 = (int)(Math.random() * 6) + 1;
			k = num3 + num4;
			if(k ==6) {
				System.out.println("num3 = " + num3);
				System.out.println("num4 = " + num4);
				System.out.println("num3 + num4 = " + (num3 + num4));
			}else {
				System.out.println("합이 6이 아닙니다.");
				}
			}
			
		
	}
}
