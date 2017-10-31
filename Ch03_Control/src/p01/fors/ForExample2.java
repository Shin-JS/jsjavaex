package p01.fors;

import java.util.Scanner;

public class ForExample2 {
	public static void main(String[] args) {
		int num = 0;
		int vertical = 0;
		Scanner keyboard = new Scanner(System.in);
		System.out.print("원하는 구구단의 단수를 입력하세요: ");
		num = keyboard.nextInt();
		System.out.println("출력할 기준(가로:1, 세로:2)를 입력하세요");
		vertical = keyboard.nextInt();
		if (vertical==1) {//가로
			if(num >= 2 && num<=9 ) {
				for (int i=1;i<=9;i++) {
					System.out.print(num+"*"+i+"="+num*i+"\t"); //"\t"= tab만큼 공백 생성
					}
				}
			}//가로 블럭 끝
		else if(vertical==2) {//세로
			for (int i=1;i<=9;i++) {
				System.out.print(num+"*"+i+"="+num*i+"\n");  //print()메소드는 문자열 출력 후 줄바꿈 되지 않음
				}
			}//세로 블럭 끝
		}
	
}
