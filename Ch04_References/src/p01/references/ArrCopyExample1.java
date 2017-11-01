package p01.references;
/**
 * 배열의 복사 
 **/
public class ArrCopyExample1 {
	public static void main(String[] args) {
		int[] a = {1,2,3,4,5,6,7}; //길이가 7인 1차원 배열
		int[] b = new int[10]; //길이가 10인 1차원 배열 요소들의 값은 0으로 초기화
		int[] c = new int[10];
		int[] d = new int[10];
		int[] e = new int[10];
		//배열 요소들의 값 복사
		//a배열의 요소들을 b배열로 복사하면 복사되지 않은 요소들은 초기값으로 존재
		for (int i = 0; i < a.length; i++) { //
			b[i] = a[i]; //a[i]값이 b[i]번째 값에 대입됨
		};
		for (int i = 0; i < b.length; i++) {
			System.out.print("b["+i+"]="+b[i]+"\t");
		}System.out.println();
		//향상된 for문(for each)사용
		for (int i:b) {
			System.out.print(i+"\t");
		}
		System.out.println();
		//System.arrayCopy()메소드를 이용하여 배열 복사하기
		System.arraycopy(a, 0, c, 0, a.length); 
		/*System.arraycopy(src, srcPos, dest, destPos, length);
		 * src = 원본array, srcPos = 원본 array의 복사 시작점, dest = 복사받을 array, dest.Pos = 복사받는 array의 복사받을 시작점, length = 얼마나 복사할지(범위or길이)?
		 */
		for (int j:c) {
			System.out.print(j+"\t");
		}
		System.out.println();
		//배열의 일부분 복사하기
		//arraycopy(원본배열,시작index,타겟배열,타겟배열의시작index,복사할길이)
		System.arraycopy(a, 0, c, 2, a.length);
		for (int j:c) {
			System.out.print(j+"\t");
		}
		System.out.println();
		
		System.arraycopy(a, 1, d, 0, a.length-1); //원본의 일부를 타겟배열로 복사
		for (int j:d) {
			System.out.print(j+"\t");
		}
		System.out.println();
		
		System.arraycopy(a, 1, e, 3, a.length-1); //a배열의 일부를 e배열에 복사
		for (int j:e) {
			System.out.print(j+"\t");
		}
		System.out.println();
		//for문을 사용하여 a배열의 1번 index부터 끝까지의 내용을 e배열의 3번index 부터 복사
		for (int i = 1; i < a.length; i++) {
			e[i+2] = a[i];
		}
		for (int i = 0; i < e.length; i++) {
			System.out.print(e[i]+"\t");
		}System.out.println();
		
	}
}
