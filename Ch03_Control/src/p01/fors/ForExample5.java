package p01.fors;
/**
 *  for문
 **/
public class ForExample5 {
	public static void main(String[] args) {
		//1~20까지의 정수 중 2의배수도 아니고 3의 배수도 아닌 수들의 합?
		int sum = 0;
		for (int i = 1; i<=20 ; i++) {
			if (i%2!=0&&i%3!=0) { //i가 2의 배수가 아님 AND 3의배수가 아님 일때 true
				sum = sum + i;
			}
		}
		System.out.println("전체합: " + sum);
	}
}
