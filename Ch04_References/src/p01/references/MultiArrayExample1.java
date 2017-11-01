package p01.references;
/**
 * 다차원배열(2차원)
 * -.1차원 배열을 묶어서 하나로 만든 배열
 * -.java에서 배열은 반드시 길이를 미리 지정해서 선언해야함
 * -.값을 저장시 index범위를 벗어나면 오류발생
 * -.index번호는 반드시 0번부터 시작
 **/
public class MultiArrayExample1 {
	public static void main(String[] args) {
		//2차원 배열 객체 생성
		int[][] a = new int[2][3]; //2x3의 배열 생성, 2차원이므로 대괄호 두개 ex) 타입[][]변수명 = new 타입[행수][열수];
		a[0][0] = 7;
		a[0][1] = 23;
		a[0][2] = 11;
		a[1][0] = 27;
		a[1][1] = 2;
		a[1][2] = 13;
		System.out.println(a.length);
		for (int i = 0; i<a.length;i++) {  //a.length는 1차원배열의 갯수를 출력
			System.out.print(a[i][0]+"\t");
			System.out.print(a[i][1]+"\t");
			System.out.println(a[i][2]+"\t");
		}
		System.out.println("===================================");
		//중첩for문사용
		for (int i = 0; i<a.length;i++) {  //a.length는 1차원배열의 갯수를 출력
			for(int j = 0; j < a[i].length;j++) { //a[행].length
			System.out.print(a[i][j]+"\t");
			}System.out.println();
		} //바깥쪽 for문 끝
		System.out.println("===================================");
		//향상된 for문 사용 (for each)
		// a[0] -> a[0][0] a[0][1] a[0][2]
		// a[1] -> a[1][0] a[1][1] a[1][2]
		for (int[] i:a) { //이차원배열의 반복자변수 선언; int[][] a => int[] 변수 : 배열이름 //
						  // int[][]a => int[] 변수: ㅁ
			for(int j:i) { // int[] i -> int j:i
				System.out.print(j+"\t");
			}System.out.println();
			
		}
	}
}
