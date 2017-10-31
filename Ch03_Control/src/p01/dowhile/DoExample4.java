package p01.dowhile;

import java.util.Scanner;

/**
 * do-while()문 
 * 반복횟수(5회)가 5회이상이면 종료되는 p/g으로 수정
 **/
public class DoExample4 {
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		int cnt = 1;
		int num;
		int answer = (int) ((Math.random()*100) + 1); //1~100사이의 임의의 수 생성
		do {
			if(cnt==6) {
				System.out.println("횟수초과로 종료합니다.");
				break;
			}
			System.out.println("1~100사이의 값을 입력하세요");
			num = sc.nextInt();
			if (answer == num) {
				System.out.println(cnt + "회만에 성공");
				break;
			}else if(answer > num) {
				System.out.println("더 큰 값을 입력하세요");
			}else if(answer < num) {
				System.out.println("더 작은값을 입력하세요");
			}
			cnt++;//카운트 횟수 증가
			
		}while(true); //조건이 true이므로 무한 반복
		sc.close();//scanner객체 자원 해제
			}
	}

