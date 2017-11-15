package p12.format;

import java.text.MessageFormat;

/**[API]
 * 메세지 포맷
 **/
public class MessageFormatExample {
	public static void main(String[] args) {
		String id = "java";
		String name = "홍길동";
		String tel = "010-123-4567";
		//MessageFormat
		String text = "회원 ID: {0} \n회원 이름: {1} \n전화번호: {2}";
		String result1 = MessageFormat.format(text, id,name,tel);
		System.out.println(result1);
		//printf("%s %s %s",id,name,tel); 과 비슷한 형태의 아래 예시
		String result2 = MessageFormat.format("회원 ID: {0} \n회원 이름: {1} \n전화번호: {2}", id,name,tel);
		System.out.println(result2);
		//insert into member values(id,name,tel);
		String sql = "insert into member vlaues({0},{1},{2})";
		Object[][] arguments = {{"java","홍길동","'010-123-4567'"},
				{"java2","홍길도","'010-123-456'"},
				{"java3","홍길ㄷ","'010-123-45'"},
				{"java4","홍길","'010-123-4'"},
				{"java5","홍기","'010-123-'"}};
		//다차원배열의 경우 처리하는방법	
		for(int i = 0; i < arguments.length;i++) {
					String result3 = MessageFormat.format(sql,arguments[i]);
					System.out.println(result3);
			}
		//1차원배열은 이렇게 하면 됨
		String result3 = MessageFormat.format(sql,arguments);
		System.out.println(result3);
		
		
	}
}
