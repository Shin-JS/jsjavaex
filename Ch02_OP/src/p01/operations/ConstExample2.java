package p01.operations;

import java.util.Scanner; //Scanner클래스는 java.util 패키지에 있음
/**
 * final 키워드를 사용하여 PI라는 상수를 선언 후 사용 
 **/
public class ConstExample2 {
	public static void main(String[] args) {
		//원의 넓이 구하기
		final double PI = 3.14D;
		Scanner keyboard =  new Scanner(System.in); //콘솔로부터 입력받기 위한 scanner객체 생성
		//반복문 사용
		try {
		while(true) { //while()문 ()안이 true일 동안 계속 반복
			System.out.println("구하기 원하는 원의 반지름을 입력하세요");
			int r = keyboard.nextInt(); //String으로 입력된 값을 int로 반환
			System.out.println("원의 넓이는 " + (r*r*PI) + "입니다");
			System.out.println("계속 하시겠습니까?");
			String yesNo = keyboard.next(); //String으로 입력된 값을 String으로 반환
			if(yesNo.charAt(0)=='n'||yesNo.charAt(0)=='N') { //charAt(0) = 문자열의 첫번째 문자하나를 반환
				break; //제어문(반복문)을 빠져나가는 명령문
				}else {
					continue;
				}
			}
		System.out.println("종료");
		//자바에서는 예외(Exception)도 객체로 취급
	}catch(java.util.InputMismatchException e) {
		System.out.println("오류:" + e.getMessage()); //예외 처리문
	}//try{실행할 명령문}catch(발생할 예외){예외시 처리문} 
	/*자바에서 예외는 2가지
	 * 1. checked Exception: 문법관련 오류를 컴파일시 체크
	 * 2. unChecked Exception(RuntimeException): 문법적 오류는 없지만, 프로그램실행시 입력자의 입력값오류 또는 연산오류에 의해 발생하는 예외
	 */
	}
}
