package p01.references;
/**
 * 배열의 복사(2)
 * -.길이가 서로 다른 복수개의 배열(타입은 동일)을 서로 이어서 새로운 길이의 배열을 만들 때 사용
 * ex) a[x], b[y] -> a.length+b.length로 새로운 배열의 길이를 확보
 * -.배열은 한번 선언되면 길이가 고정되어서 늘릴 수 없기 때문에, 새로운 배열을 만들어 기존 배열의 값을 복사하여 사용
 **/
public class ArrCopyExample2 {
	public static void main(String[] args) {
		String cities[] = {"서울","대구","춘천","고양","광주","천안"};
		String nations[] = {"한국","미국","영국","일본","프랑스"};
		System.out.println("cities[]의 길이:"+cities.length);
		System.out.println("nations[]의 길이:"+nations.length);
		String[] newStr = new String[cities.length+nations.length];
		System.out.println("newStr[]의 길이:"+newStr.length);
		//for문을 이용한 복사
		for (int i = 0; i < cities.length; i++) {
			newStr[i] = cities[i];
		}
		for (String s:newStr) {
			System.out.print(s+"\t");
		}System.out.println();
		for (int j = 0; j < nations.length;j++) {
			newStr[cities.length+j] = nations[j];
		}
		for (String s:newStr) {
			System.out.print(s+"\t");
		}System.out.println();
		//System.arraycopy메소드를 이용한 복사
		System.arraycopy(cities, 0, newStr, 0, cities.length);
		System.arraycopy(nations, 0, newStr, cities.length, nations.length);
		for (String s: newStr) {
			System.out.print(s+"\t");
		}System.out.println();
	}
}
