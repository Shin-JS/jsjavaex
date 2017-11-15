package p07.regularExpression;

import java.util.regex.Pattern;

/**[API]
 * 
 **/
public class PatternExample {
	public static void main(String[] args) {
		//()그룹핑, '\'뒤에 특수문자→\d: 숫자 한개, {3,4}: 3~4개의 숫자
		String regExp = "(02|010)-\\d{3,4}-\\d{4}";
		String data = "010-123-4567";
		boolean result = Pattern.matches(regExp, data);
		if(result) {
			System.out.println("정규식과 일치합니다.");
		}else {
			System.out.println("정규식과 일치하지 않습니다.");
		}
		
		//만약 정규식이 없다면...........
		//substring(시작index, 끝index); → '시작index<=~~~<끝index' 까지 잘라냄
		boolean result1 = false;
		boolean result2 = false;
		boolean result3 = false;
		String str1 = data.substring(0,data.indexOf("-"));
		String str2 = data.substring(data.indexOf("-")+1,data.lastIndexOf("-"));
		String str3 = data.substring(data.lastIndexOf("-")+1);
		System.out.println(str1);
		System.out.println(str2);
		System.out.println(str3);
		if(str1.length()>=2&&str1.length()<=3) {
			result1 = true;
		}
		if(str2.length()>=3&&str2.length()<=4) {
			result2 = true;
		}
		if(str3.length()==4) {
			result3 = true;
		}
		if (result1==true&&result2==true&&result3==true) {
		System.out.println("자릿수가 맞습니다");
		}else{
			System.out.println("자릿수가 맞지않습니다.");
		}
	}
}
