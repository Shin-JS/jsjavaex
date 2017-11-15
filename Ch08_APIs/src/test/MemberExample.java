package test;

import java.util.Scanner;
import java.util.regex.Pattern;

/**
 * 회원가입
 * id: 5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용가능
 * password: 6~16자 영문 대 소문자, 숫자, 특수문자 사용
 * name : 5자 이하 한글
 **/
public class MemberExample {
	public static void main(String[] args) {
		boolean result = false;
		char yesNo;
		Scanner scanner = new Scanner(System.in);
		System.out.println("회원가입 하시겠습니까?(Y/N)");
		yesNo = scanner.next().charAt(0);
		if(yesNo=='Y'||yesNo=='y') {
		System.out.print("가입할 id를 입력하세요(5~20자리의 영문 소문자, 숫자와 특수기호(_-)만 사용가능합니다");
		String id = scanner.next();
		//id체크 Pattern.match
		String idregExp = "[a-z0-9_-]{5,20}";
		result = Pattern.matches(idregExp, id);
		if(result) {
			//비밀번호체크
			System.out.print("비밀번호를 입력하세요( 6~16자의 영문 대소문자, 숫자, 특수문자(~!@##$%^&)만 입력 가능합니다.)");
			String password = scanner.next();
			String pwregExp = "[a-zA-Z0-9!@#$%^&~]{6,16}"; //대괄호와 중괄호 사이에 공백이 있으면 안됨....
			result = Pattern.matches(pwregExp, password);
			if(result) {
				//이름체크
				System.out.print("이름을 입력하세요");
				String name = scanner.next();
				String nameRegExp = "[ㄱ-ㅎ|ㅏ-ㅣ|가-힇]{1,5}";
				result = Pattern.matches(nameRegExp, name);
				if(result) {
				Member member = new Member(id,password,name);
				System.out.println("가입완료");
				System.out.println(member);
				}else {//이름이 규칙에 안맞을때 출력
					System.out.println("이름은 5자이하 한글만 지원합니다.");
				}
			}else {//비밀번호가 규칙에 안맞을때 출력
				System.out.println("비밀번호는 6~16자의 영문 대소문자, 숫자, 특수문자(~!@##$%^&)만 입력 가능합니다.");
			}
		}else {//아이디가 규칙에 안맞을경우 출력
			System.out.println("아이디는 5~20자의 영문소문자, 숫자, 특수문자(_,-)만 입력가능합니다.");
		}
		}else {//회원가입을 하지 않을때 출력
			System.out.println("회원가입을 하지 않습니다.");
		}
		
	}
}
