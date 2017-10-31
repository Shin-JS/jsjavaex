package p01.whiles;

import java.util.Scanner;

/**
 * 중첩 while문 
 **/
public class WhileExample3 {
	public static void main(String[] args) {
		Scanner num = new Scanner(System.in);
		boolean isContinue = true;
		while(isContinue) {
		int i = 1;
		int j = 2; //초기값 지정
			System.out.print("값을 입력하세요: ");
			int num1 = num.nextInt(); 
			while(i <= 9) { //반복문을 빠져나갈 수 있는 조건
				while(j <= num1) {
					System.out.print(j+"x"+i+"="+j*i+"\t");
					j++;//j값 증가
				}System.out.println();
				j=2; //다시 초기화
				i++; //i값 증가
			}//외곽 while문의 끝부분
			System.out.println("계속 하시겠습니까?(y/n)");
			char c = num.next().charAt(0);
			if (!(c=='y'||c=='Y')) {
				isContinue = false;
			}else {
				isContinue = true;
			}
		}System.out.println("종료");
	}
}
