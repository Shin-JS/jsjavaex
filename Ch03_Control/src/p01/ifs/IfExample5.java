package p01.ifs;

import java.util.Scanner;

public class IfExample5 {
	public static void main(String[] args) {
		int score = 0;
		String grade = "";
		Scanner keyboard = new Scanner(System.in); 
		while(true) {
		System.out.print("점수를 입력하세요");
		score = keyboard.nextInt();
		//if문의 시작
		if (score >= 90) {
			grade = "A";
		}else if (score >= 80) {
			grade = "B";
		}else if (score >= 70) {
			grade = "C";
		}else if (score >= 60) {
			grade = "D";
		}else {
			grade = "F";
		}//if문의 종류
		if (score >=100) {//if문의 시작
			grade = "A+";
		}else if (score >= 60) {
			if (score%10>7) {
				grade += "+";
			}else if (score%10<4) {
				grade += "-";
			}else {
				grade += "0";
			}
		}//if문의 끝
		System.out.println("점수는" + grade + "입니다.");
		System.out.println("계속 하시겠습니까?(Y/N)");
		String yesNo = keyboard.next().trim(); //문자열로 받음.
		if (yesNo.equalsIgnoreCase("n")) { //equalsIgnoreCase=>대소문자 구분없이...
			break;
		}else {
			continue;
		}
		}//while문의 끝
		System.out.println("종료");
	}
}
