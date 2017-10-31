package p01.switches;

import java.util.Scanner;

/**
 * 조건문 - Switch문 
 * switch(조건) - 조건에 따라 미리 실행할 작업을 분기해놓은 제어문
 **/
public class SwitchExample1 {
	public static void main(String[] args) {
		int score = 0;
		String grade = "";
		boolean isContinue = true;
		while(isContinue) {
		Scanner keyboard = new Scanner(System.in);
		System.out.print("점수를입력하세요: ");
		score = keyboard.nextInt();
		//case에 따라 분기
		switch(score/10) {
		case 10: //break문이 없으면 아래 case문까지 실행됨 
		case 9: grade = "A"; break; //break문이 있어서 해당case문만 실행하고 switch()문을 벗어남
		case 8: grade = "B";break;
		case 7: grade = "C";break;
		case 6: grade = "D";break;
		default: grade = "F";
		}
		//중첩 if문
		if(score>=60 && score <100) {
			if(score%10>7) {
				grade += "+";
			}else if (score%10<4) {
				grade +="-";
			}else {
				grade += "0";
			}
		}
		System.out.println("등급은 " + grade);
		System.out.println("계속 진행하시겠습니까?(Y/N)");
		//char타입의 값을 'y'와 비교연산자 == 로 비교 -> char타입은 기본데이터타입이므로  ==연산자로 비교가능
		if(keyboard.next().equalsIgnoreCase("n")) {//문자열로 받음, equalsIgnoreCase("문자열") - 문자열 비교 메소드, String타입의 값은 메소드로 비교
			isContinue = false;
		}else {
			isContinue = true;
		}
		}//while문의 끝
		System.out.println("종료");
	}
}
