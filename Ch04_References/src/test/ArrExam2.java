package test;

import java.util.Scanner;

public class ArrExam2 {
	public static void main(String[] args) {
		boolean run = true;
		int studentNum = 0;
		int[] scores = null;
		boolean run2 = true;
		Scanner scanner = new Scanner(System.in);
		while(run) {
			System.out.println("---------------------------------------");
			System.out.print("1.학생수|2.점수입력|3.점수리스트|4.분석|5.종료");
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
			}else if(selectNo==5) {
				run = false;//종료
			}else if(selectNo==4) {
				while(run2) {
					System.out.println("---------------------------------------");
					System.out.print("1.오름차순정렬|2.내림차순정렬|3.등급|4.종료");
					System.out.println();
					System.out.println("---------------------------------------");
					System.out.print("선택>");
					int selectNo2 = scanner.nextInt();
					if(selectNo2==1) {
						System.out.println("오름차순 정렬");
						int sort;
						for (int i = 0; i < scores.length; i++) {
							for (int j = i+1; j < scores.length; j++) {
								if (scores[i] > scores[j]) {
									sort = scores[i];
									scores[i] = scores[j];
									scores[j] = sort;
								}
							}
							System.out.println(scores[i]);
						}//오름차순 정렬 for문 종료
					}else if (selectNo2==2) {//4-1에 대한 if문 종료
						System.out.println("내림차순 정렬");
						int sort;
						for (int i = 0; i < scores.length; i++) {
							for (int j = i+1; j < scores.length; j++) {
								if (scores[i] < scores[j]) {
									sort = scores[i];
									scores[i] = scores[j];
									scores[j] = sort;
								}
							}
							System.out.println(scores[i]);
					}//내림차순정렬 for문 종료	
				}else if (selectNo2==3) {
					for (int i = 0; i < scores.length;i++) {
						if (scores[i]>=90) {
							System.out.println(scores[i]+" = A");
						}else if (scores[i]>=80) {
							System.out.println(scores[i]+" = B");
						}else if (scores[i]>=70) {
							System.out.println(scores[i]+" = C");
						}else if (scores[i]>=60) {
							System.out.println(scores[i]+" = D");
						}else {
							System.out.println(scores[i]+" = F");
						}
					}
				}else if (selectNo2==4) {//5-3 else if 종료
					run2 = false;
				}
			}//4번선택 else if문 종료
				System.out.println("메인메뉴로 돌아갑니다.");
		}
	}//외곽 while문 종료
		System.out.println("종료합니다.");
	}
}
