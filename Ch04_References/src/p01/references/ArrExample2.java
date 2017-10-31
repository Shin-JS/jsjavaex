package p01.references;
/**
 * 배열 
 **/
public class ArrExample2 {
	public static void main(String[] args) {
		int[] a = {23,45,67,789,2}; //초기값으로 배열 생성 가능
		for (int i = 0; i<a.length;i++) {  // length필드를 이용하여 배열의 길이를 구함
			System.out.println("a["+i+"]="+a[i]); //배열의 요소 값 출력
			//향상된 for문(자바1.5부터 지원)
			for (int k:a) {  //for(객체타입변수:객체변수명){변수}
				System.out.println("k="+k);
			}
		}
		System.out.println("====================================");
//		int[] b = new int[4];  //선언후
//		b = {23,45,67,789,2}; //참조변수에 객체를 대입하면 오류가 발생
		int[] c;
		c = new int[] {23,45,67,789,2}; //new키워드로 객체를 생성하면서 초기값으로 요소들을 입력
		//String s; s=new String(초기값); 과 유사
		for (int i = 0; i<c.length;i++) {
			System.out.println("c["+i+"]="+c[i]);
		}
		int i = 0;
		for (int j:c) { //선언된 변수 j(반복자, iterate)
			System.out.println("c["+i+"]"+j);
			i++;
		}
	}
}
