package p01.operations;

import java.util.Scanner;

/**
 * 사칙연산 
 **/
public class OperExample2 {
	public static void main(String[] args) {
		//콘솔로부터 값을 입력받기위한 객체(instance) 생성
		Scanner scanner = new Scanner(System.in);//System.in = 입력스트림
		System.out.println("첫번째값을 입력하세요: ");
		int x = scanner.nextInt();//입력받은 문자열타입의 값을 int타입으로 변환하여 x값에 대입
		System.out.println("두번째값을 입력하세요: ");
		int y = Integer.parseInt(scanner.next()); //scanner.next()는 입력받은 문자열타입의 값을 문자열로 출력 (그래서 앞에 Integer.parseInt()가 붙었다)
		//입력받은 값으로 사칙연산
		//"문자열"+(문자열이 아닌 식의 결과값, 문자열이 아닌값)의 결과는"문자열"로 출력
		//println()메소드는 문자열 타입을 출력하는 메소드
		System.out.println("x + y = " +(x+y));
		System.out.println("x - y = " +(x-y));
		System.out.println("x × y = " +(x*y));
		System.out.println("x ÷ y = " +(x/y));
		
	}
}
