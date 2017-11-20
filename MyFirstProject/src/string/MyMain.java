package string;

public class MyMain {
	public static void main(String[] args) {
		//String에 관련한 메소드를 적절히 확인하고 사용. api참조
		//String비교는 equals를 사용하여 비교
		String str = "   my text   ";
		String str1 = "text";
		String str2 = "text";
		String str3 = new String("text");
		
		System.out.println(str);
		System.out.println(str.trim()); //좌우의 불필요한 공백 제거
		System.out.println(str.indexOf("my"));
		System.out.println(str.length());
		System.out.println(str.substring(3)); //0~2번문자까지 제거 (문자열 추출 3번부터~~)
		System.out.println(str.substring(3, 5)); //3번에서 5번문자까지 추출
		
		System.out.println(str1 == str2);
		System.out.println(str1.equals(str2));
		System.out.println(str2 == str3); 
		System.out.println(str2.equals(str3));
	}
}
