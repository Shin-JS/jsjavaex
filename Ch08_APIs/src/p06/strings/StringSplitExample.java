package p06.strings;
/**[API]
 * 
 **/
public class StringSplitExample {
	public static void main(String[] args) {
		String text = "고길동&도우너,또치,둘리-마이콜 ddd";
		//split()메소드는 매개변수로 받은 구분자를 기준으로 토큰들을 추출함
		String[] names = text.split("&|,|-| ");
		for(String name: names) {
			System.out.println(name);
		}
	}
}
