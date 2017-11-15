package p06.strings;

import java.util.StringTokenizer;

/**[API]
 * 
 **/
public class StringTokenizerExample {
	public static void main(String[] args) {
		String text = "가나다/라마바/사아자/차카타";
		//객체 생성시 구분자를 기준으로 문자를 잘라서 저장
		StringTokenizer st = new StringTokenizer(text,"/");
		int count = st.countTokens(); //토근화된 문자열의 갯수 리턴
		for(int i = 0; i <count ; i++) {
			String token = st.nextToken();
			System.out.println(token);
		}
		System.out.println();
		st = new StringTokenizer(text, "/");
		//hasMoreTokens():남은 토큰이 있는지 확인해주는 메소드
		while(st.hasMoreTokens()) {
			String token = st.nextToken();
			System.out.println(token);
		}
	}
}
