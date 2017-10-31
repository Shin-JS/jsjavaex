package p01.operations;

import java.util.Scanner;

/**
 * 조건연산(삼항연산자)
 * (조건식) ? 참:거짓
 * 삼항연산자 중첩사용시
 * (조건식) ? 참:((조건)?참:(조건)?참:.........)  
 **/
public class OperExample6 {
	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);
		boolean isContinue = true;
		while(isContinue) {	//boolean타입의 값은 제어문(반복문)의 제어에 사용
		System.out.println("점수를 입력하세요: ");
		//next() 키보드로 입력된 문자열 값을 문자열로 리턴하는 메소드
		int score = scanner.nextInt();
		char grade = ' ';
		//삼항연산자를 이용하여 grade를 출력(삼항연산자의 중첩사용)
		grade = (score > 90) ? 'A':((score > 80) ? 'B' : (score > 70) ? 'C':'F');
		System.out.println(grade);
		System.out.println("종료하시겠습니까?");
		//charAt(index)메소드는 문자열에서 해당index번지의 문자 하나를 추출하는 메소드
		char yesNo = scanner.next().charAt(0);
		isContinue = (yesNo=='y'||yesNo=='Y')? false:true; //true인동안 계속 while문이 실행되기때문에....... 종료하겠냐? 물어보면 false해야함
		System.out.println("종료");
		}
	}
}
