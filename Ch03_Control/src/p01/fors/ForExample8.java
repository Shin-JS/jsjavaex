package p01.fors;

import java.util.Scanner;

/**
 * 중첩 for문을 이용한 구구단 출력 
 **/
public class ForExample8 {
	public static void main(String[] args) {
		//2단부터 입력받은 단수까지 구구단을 세로로 출력
		Scanner scanner = new Scanner(System.in);
		while(true) {
			System.out.print("2단부터 출력받기 원하는 구구단의 단수를 입력하세요: ");
			int num = scanner.nextInt();
			for (int i = 1; i <= 9 ; i++) {
				for (int j = 2; j <= num; j++) {
					System.out.print(j + "x" + i +"=" + (i * j)+"\t");
				}System.out.println();
			}
			System.out.println("계속하시겠습니까?(Y/N)");
			char c = scanner.next().charAt(0);
			if (c=='n'||c=='N') {
				break;//반복문을 빠져나가는 명령문
			}
		}System.out.println("종료");
	}
}
