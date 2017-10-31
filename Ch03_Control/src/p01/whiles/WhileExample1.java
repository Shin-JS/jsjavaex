package p01.whiles;
/**
 * while문(조건식) {실행문} 
 * -.for문은 시작과 종료시점을 알고 있을때 사용
 * -.while문은 시작과 종료시점을 알지 못할때 주로 사용
 **/
public class WhileExample1 {
	public static void main(String[] args) {
		int sum = 0;
		int i = 0;
		while (i<=10) { //while(조건식)이 true일동안 실행
			sum = sum + i;
			System.out.println(i+"일 때 합계는: " + sum);
			i++;//증감식은 {}실행부 내에서 기술, while문에서 증감이 없으면 무한루프에 빠질 수 있음.
		}
		System.out.println("최종합계: " + sum);
	}
}
