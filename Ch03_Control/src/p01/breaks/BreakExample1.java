package p01.breaks;
/**
 * break문 
 **/
public class BreakExample1 {
	public static void main(String[] args) {
		float f = 1252;
		System.out.println(f);
		double d = 25.5;
		System.out.println(d);
		int num = 0;
		int sum = 0;
		while(true) {
			num++;
			sum += num;
			if(num == 100) {
				break; //while문을 빠져나가기위한 명령문
			}
			System.out.println("합계는"+sum);
			System.out.println("종료");
		}
	}
}
