package p01.switches;

import java.util.Scanner;

/**
 * switch(조건문){case: break;} 
 **/
public class SwitchExample3 {
	public static void main(String[] args) {
		//계산기만들기(값1 op 값2)
		int arg1 = 0;
		int arg2 = 0;
		char op = ' ';
		boolean isContinue = true;
		double result = 0.0;
		//키보드값을 입력받는 scanner객체 생성
		Scanner keyboard = new Scanner(System.in);
		System.out.println("계산기 프로그램 값1 op 값2 형태");
	while(isContinue)	{
		System.out.print("첫번째값을 입력하세요: ");
		arg1 = keyboard.nextInt();
		System.out.print("연산자를 입력하세요(+,-,*,/)");
		op = keyboard.next().charAt(0);
		System.out.print("두번째값을 입력하세요: ");
		arg2 = keyboard.nextInt();
		switch (op) {
		case '+': result = (double) arg1 + (double) arg2; //강제형변환(casting)
				break;
		case '-': result = (double) arg1 - (double) arg2;
				break;
		case '*': result = (double) arg1 * (double) arg2;
				break;
		case '/': result = (double) arg1 / (double) arg2; //int타입/int타입의 결과는 int
				break;
		}
		System.out.println(arg1+"와(과)"+arg2+"의"+op+ "연산결과는" + result + "입니다.");
		System.out.println("계속 진행하시겠습니까?(Y/N)");
		/*char c = keyboard.next().charAt(0);
		 * if (c=='y'||c=='Y')//동등비교연산
		 * 	isContinue = true;
		 * else
		 * 	isContinue = false;
		 * */
		if (keyboard.next().equalsIgnoreCase("n")) {
			isContinue = false;
		}else {
			isContinue = true;
		}
	}//while문 끝
	System.out.println("종료");
	}
}
