package p01.tryCatchfinally;

import java.util.Scanner;

/**[예외처리]
* -.문법적으로 체크가 되는 예외들은 checkedException, 문법적으로 문제가 없지만 실행시 발생하는 예외는 uncheckedException,
*   uncheckedException은 일반적으로 개발자의 경험으로 처리하는 경우가 많다
**/
public class ExceptionExample2 {
	public static void main(String[] args) {
		int result = 0, num1 = 0, num2 = 0;
		Scanner sc = new Scanner(System.in);
		do {
			try {
				System.out.println("첫 번째 숫자를 입력하세요");
				num1 = sc.nextInt();
				if (num1==0) break;
				System.out.println("두번째 숫자를 입력하세요");
				num2 = Integer.parseInt(sc.next());
				result = num1 / num2;
				System.out.printf("%d / %d = %d\n", num1,num2,num1/num2);
			}catch(ArithmeticException e) {
				System.out.println("0으로 나눌 수 없음");
			}catch(NumberFormatException e) {
				System.out.println("숫자형 문자열만 입력하세요");
			}finally {
				System.out.println("종료 전 실행");
			}
			
		}while(true);
		System.out.println("프로그램 종료");
		sc.close(); //사용한 자원 해제
	}
}
