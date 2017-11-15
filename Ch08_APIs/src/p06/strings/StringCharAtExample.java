package p06.strings;
/**[API]
 * 
 **/
public class StringCharAtExample {
	public static void main(String[] args) {
		String ssn = "010624-1230123";//13자리 숫자 중 마지막 13번째 값을 check digit, 앞 12자리의 값들이 산식에 의해 출력된 값이 13번째 값과 같아야 한다.
		//문자열내의 특정위치의 문자 하나를 추철하는 메소드
		char gender = ssn.charAt(ssn.indexOf("-")+1);
		switch(gender) {
		case '1':
		case '3':
				 System.out.println("남자입니다.");
				 break;
		case '2':
		case '4':
			System.out.println("여자입니다.");
		}//switch끝
		String str1 = new String("홍길동"); //문자열 객체 생성
		String str2 = "홍길동"; //문자열 리터럴
		if(str1 == str2) {
			System.out.println("같은 String객체 참조");
		}else {
			System.out.println("다른 String객체 참조");
		}
		if(str1.equals(str2)) {
			System.out.println("같은 내용");
		}else {
			System.out.println("다른 내용");
		}
		//indexOf()메소드: 문자의 위치를 리턴, 만약 찾는 문자 패턴이 없으면 -1을 리턴
		//문자열.indexOf("패턴)의 결과값이 -1 → 찾는 문자열이 없다.
		String subj = "자바 프로그래밍";
		int location = subj.indexOf("프로그래밍");
		if(subj.indexOf("자바")!=-1) {
			System.out.println("자바와 관련이 있는 책이군요");
		}else {
			System.out.println("자바와 관련이 없는 책이군요");
		}
		int length = ssn.length(); //문자열의 길이 리턴(1부터 시작)
		if(length==14) {
			System.out.println("주민번호 자리수가 맞습니다.");
		}else {
			System.out.println("주민번호 자리수가 아닙니다.");
		}
		String oldStr = "자바는 객체지향 언어입니다. 자바는 풍부한 API를 지원합니다.";
		String newStr = oldStr.replace("자바", "JAVA");
		System.out.println(newStr);
		
		//문자열 자르기
		ssn = "880815-1234567";
		//index의 범위 0≤ 범위 ＜6
		String firstNum = ssn.substring(0, 6); //0~5까지 추출
		System.out.println(firstNum);
		String secondNum = ssn.substring(7); //7부터 끝까지
		System.out.println(secondNum);
		
		//대소문자 변경
		String sstr1 = "Java Programming";
		String sstr2 = "JAVA PROGRAMMING";
		System.out.println(sstr1.equals(sstr2));
		//문자열의 내용비교 equals
		//toLowerCase(): 모두 소문자로 변경
		//"java programming"이 하나 만들어져있기 때문에, 새로 만들지 않고 위의 값을 참조함
		String lowerstr1 = sstr1.toLowerCase();
		String lowerstr2 = sstr2.toLowerCase();
		System.out.println(lowerstr1.equals(lowerstr2));
		//equalsIgnoreCase(): 대소문자 구분없이 내용비교
		System.out.println(sstr1.equalsIgnoreCase(sstr2));
		
		//문자열 공백제거: trim();
		String tel1 = "  02";
		String tel2 = "123  ";
		String tel3 = "  1234   ";
		String tel = tel1.trim()+"-"+tel2.trim()+"-"+tel3.trim();
		System.out.println(tel);
		
		//기본데이터 타입의 데이터를 문자열로 변경
		String val1 = String.valueOf(10); //int 10 를 숫자형 문자열 "10"으로 변경
		String val2 = String.valueOf(10.5); //double 형 10.5를 숫자형 문자열 "10.5"로 변경
		String val3 = String.valueOf(true); //boolean타입의 true를 문자열 "true"로 변경
		
		System.out.println(val1);
		System.out.println(val2);
		System.out.println(val3);
	}
}
