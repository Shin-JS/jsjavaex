package p01.dowhile;

import java.util.Scanner;

/**
 * do-while문 
 **/
public class DoExample3 {
	public static void main(String[] args) {
		int num = 0;
		int i = 1;
		Scanner scanner = new Scanner(System.in);
		System.out.println("종료하려면 y");
		do {
			System.out.println("숫자를 입력하세요");
			num = (int)scanner.next().charAt(0)-'0'; //char->int타입 자동 형변환(ascii코드로.......)
			if (num>=2&&num<=9) {
				while (i<=9) {
					System.out.println(num + "x" + i + "="+ i*num);
					i++;
				}
			}
			i=1;
		} while (num!=73); //입력받은값이 'a'이면 종료
		System.out.println("프로그램 종료");
	}
}

//next()메소드는 키보드로 입력한 String타입의 문자값+"\n"을 읽어들임
//next()메소드는 리턴시 "\n"문자는 생략하고 입력한 문자값만 출력
//read()메소드는 리턴시 "\n"까지 출력
