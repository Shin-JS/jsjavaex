package p01.ifs;

import java.util.Scanner;

/**
 * 중첩if - if문내에 if문이 존재 
 *        - 대분류 후 소분류 식으로 구분을 주어야 하는 경우 주로 사용	
 **/
public class IfExample4 {
	public static void main(String[] args) {
		int score = 0; //로컬변수 선언, 초기화
		boolean isContinue = true;
		String grade = "";//문자열타입의 변수 grade 초기화
		Scanner keyboard = new Scanner(System.in); 
		while (isContinue) { //while문의 시작
		System.out.print("점수를 입력하세요");
		score = keyboard.nextInt(); //Integer.parseInt():문자열의 값을 숫자(int)로 변환하는 메소드
		//A(A+,A0,A-)		
		if(score >= 90) {// 중첩 if문 -if문내 if-else if문 존재
			if (score >= 97) {
				grade = "A+"; 
			}else if (score <93) {
				grade ="A-";
			}else {
				grade = "A0";
			}
		}else if(score >= 80) {
			if (score >= 87) {
				grade = "B+"; // 87< B+ < 90
			}else if (score <83) {
				grade ="B-"; // 80 <B- < 82
			}else {
				grade = "B0"; //83 < B0 < 86
			}
		}else if(score >= 70) {
			if (score >= 77) {
				grade = "C+";
			}else if (score <73) {
				grade ="C-";
			}else {
				grade = "C0";
			}
		}else if(score >= 60) {
			if (score >= 67) {
				grade = "D+";
			}else if (score <63) {
				grade ="D-";
			}else {
				grade = "D0";
			}
		}else {
			grade = "F";
		}//제어문 끝
		System.out.println("점수는" + grade + "입니다.");
		System.out.println("계속하시겠습니까?(Y/N)");
		char yesNo = keyboard.next().charAt(0);
//		if((keyboard.next().charAt(0)=='y'||keyboard.next().charAt(0)=='Y')) { 좌항의 값이 false일경우 우항을 통해 or연산의true/false판별을 위해 한번 더 입력 실행.......
		if (yesNo=='y'||yesNo=='Y') {
			isContinue = true;
		}else {
			isContinue = false;
		}
		}//while문의 끝
		System.out.println("종료");
	}//main메소드 끝
}
