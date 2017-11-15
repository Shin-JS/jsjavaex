package p07.regularExpression;

import java.util.Scanner;
import java.util.regex.Pattern;

/**[API]
 * 
 **/
public class PatternExample2 {
	public static void main(String[] args) {
		String regExp = "\\w+@\\w+\\.\\w+(\\.\\w+)?";//?:있을수도..없을수도
		String data = "angel@naver.com";
		boolean result = Pattern.matches(regExp, data);
		if(result) {
			System.out.println("기준에 맞습니다.");
		}else {
			System.out.println("기준과 다릅니다");
		}
		
		regExp = "[ㄱ-ㅎ|ㅏ-ㅣ|가-휳]"; //p237참고
		data = "홍";
		result = Pattern.matches(regExp, data);
		if(result) {
			System.out.println("기준에 맞습니다.");
		}else {
			System.out.println("기준과 다릅니다");
		}
		Scanner scanner = new Scanner(System.in);
		//패스워드 앞에 특수문자 1개, 알파벳 3 + 수자 2 →패스워드체크 표현식
		regExp="[!@#$%^&*][a-zA-Z]{3}[0-9]{2}";
		int cnt = 0;
		while(true) {
		if(cnt>=5) {
			System.out.println("종료");
			System.exit(0);
		}else {
			System.out.println("비밀번호를 입력하세요: ");
			data = scanner.next();
			result = Pattern.matches(regExp, data);
			if(result) {
				System.out.println("로그인 성공");
				System.exit(0);
			}else {
				System.out.println("로그인 실패");
				++cnt;
				System.out.println(cnt);
			}
			}
		}
	}
}
