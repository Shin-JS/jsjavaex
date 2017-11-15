package p06.strings;
/**[API]
 * 
 **/
public class StringBuilderExample {
	public static void main(String[] args) {
		//String str = "Java"
		//str+="program study";
		//StringBuilder는 내부에 버퍼(배열과 비슷한 메모리공간)가 있음
		StringBuilder sb = new StringBuilder();
		//append()문자열 추가 메소드
		sb.append("Java ");
		sb.append("Program Study");
		System.out.println(sb.toString());
		//index위치 4에 문자열 2를 삽입
		sb.insert(4, "2");//
		System.out.println(sb.toString());
		sb.setCharAt(4, '6');//문자를 수정(교체?)
		System.out.println(sb.toString());
		sb.replace(6, 13, "book");
		System.out.println(sb.toString());
		sb.delete(4, 5);
		System.out.println(sb.toString());
		int length = sb.length();
		System.out.println("총문자수: " + length);
		String result = sb.toString();
		System.out.println(sb.toString());
	}
}
