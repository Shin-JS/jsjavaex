package p02.enums;

import java.util.Scanner;

public class EnumMethodExample2 {
	public static void main(String[] args) {
		Gender gender = null;
		Scanner scanner = new Scanner(System.in);
		System.out.print("성별을 입력하세요(남:MALE,여:FEMALE): ");
		String gnd = scanner.next();
		if (gnd.equalsIgnoreCase("male")) { //대소문자 구분없이 입력받을 수 있도록 만들기 위해 서 입력한 if문
			gender = Gender.MALE;
		}else if (gnd.equalsIgnoreCase("female")) {
			gender = Gender.FEMALE;
		}
		//gender.Gender.valueOf(scanner.next()) : 열거형.valueOf(문자열)->입력한 문자열을 열거상수로 변환하는 메소드
		//gender = Gender.valueOf(gnd); 위의 if문 안쓰고 쓸때 
		if (gender==Gender.MALE) {
			System.out.println("남성입니다.");
		} else if(gender==Gender.FEMALE) {
			System.out.println("여성입니다.");
		}
		//성별을 입력받아서
		//남성이면 "남성입니다.", 여성이면"여성입니다"를 출력 할 수 있도록   
	}
}
