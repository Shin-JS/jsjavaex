package p01.ifs;

import java.util.Scanner;

/**
 * if-else if-else: 둘 중 하나인 경우가 아닌 다수의 경우가 발생하는 경우 
 **/
public class IfExample3 {
	public static void main(String[] args) {
		while (true) {//while문 시작(점수입력을 새로 받아야해서 여기서 시작.. 아래서 시작하는것보다 이게 보기 더 좋음)
			Scanner keyboard = new Scanner(System.in);
			System.out.print("점수를 입력하세요");
			try { //try시작

				int score = keyboard.nextInt(); // String타입으로 입력된 문자열을 숫자로 반환
				String grade = "";//등급
				if (score < 0) { //제어를 개발자가 임으로 바꾸는 경우
					System.out.println("0보다 큰 값을 입력하세요");
					score = keyboard.nextInt();
				}
				//조건문 if-else if-else
				if (score >= 90) {
					grade = "A"; //90이상인경우 실행
				}else if(score >= 80) {
					grade = "B"; //89~80인경우 실행
				}else if(score >= 70) {
					grade = "C"; //79~70인경우 실행
				}else if(score >= 60) {
					grade = "D"; //69~60인경우 실행
				}else {
					grade = "F"; //59이하인경우 실행
				}
				System.out.println("입력한 점수는 " + grade + "입니다.");
				System.out.println("계속 진행하시겠습니까? (Y/N)");
				String yesNo = keyboard.next();
				if (yesNo.charAt(0)=='n'||yesNo.charAt(0)=='N') {
					break;
				}else {
					continue;
				}
			
			}/*try끝*/catch(java.util.InputMismatchException e) { //catch시작
				System.out.println(e.getMessage());//오류출력
				}//catch끝
		}System.out.println("종료");//while문 종료
	}
}
