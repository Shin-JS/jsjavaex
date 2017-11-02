package test;

import java.util.Scanner;

public class ArrExam {
	public static void main(String[] args) {
		boolean run = true;
		int studentNum = 0;
		int[] scores = null;
		Scanner scanner = new Scanner(System.in);
		while(run) {
			System.out.println("---------------------------------------");
			System.out.print("1.학생수|2.점수입력|3.점수리스트|4.종료");
			System.out.println();
			System.out.println("---------------------------------------");
			System.out.print("선택>");
			int selectNo = scanner.nextInt();
			if(selectNo == 1) {
				System.out.print("학생수를 입력하세요>");
				studentNum = scanner.nextInt();
				scores = new int[studentNum];
			}else if(selectNo==2) {
				for (int i = 0; i<scores.length; i++) {
					System.out.print((i+1)+"번째 학생의 점수를 입력하세요>");
					scores[i] = scanner.nextInt();
				}	
			}else if(selectNo==3) {
				for (int i=0;i<scores.length;i++) {
					System.out.println("scores["+(i+1)+"]"+"="+scores[i]);
				}
			}else if(selectNo==4) {
				run = false;//종료
			}
		}//while문 끝
		System.out.println("종료합니다.");

	}
}
