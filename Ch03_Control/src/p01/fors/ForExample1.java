package p01.fors;
/**
 * 반복문(for, while, do-while)
 * -. 주로 시작과 끝을 알 수 있을때 사용 
 **/
public class ForExample1 {
	public static void main(String[] args) {
		//1 ~ 10까지의 합 구하기
		int sum = 0;
		for (int i = 1; i<=10; i++) { //초기식: int i = 1; if(i<=10) true 이면 실행; i = i+1(1씩증가);
			sum = sum + i;
		}
		System.out.println("sum = " + sum);
		
		int j = 1; //초기식
		for (;j<=10;) {  //if (j<=10)이 true이면 실행 == while(j<=10)
			sum = sum+j;
			j++; //증가식
		}
		System.out.println("sum = "+sum);
	}
}
