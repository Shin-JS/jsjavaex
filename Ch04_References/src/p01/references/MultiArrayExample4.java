package p01.references;
/**
 * 가변길이의 2차원 배열(2) 
 **/
public class MultiArrayExample4 {
	public static void main(String[] args) {
		int sum = 0; //모든 요소들의 합
		double avg = 0.0; //평균
		int cnt = 0;
		int[][] a = {{12,34,32},{21,54,76,23},{12,65}}; //1차원 초기값으로 2차원배열 생성
		for(int i = 0; i<a.length; i++) {
			for(int j = 0; j < a[i].length; j++) {
				System.out.print(a[i][j]+"\t");
			}//안쪽 for문 끝
			System.out.println();
		}//바깥쪽 for문 끝
		System.out.println("=============================");
		//향상된 for문(for each) 사용
		for (int[] i :a) {
			for (int j:i) {
				sum += j;
				cnt++;
				System.out.print(j+"\t");
			}//안쪽 for문끝
			System.out.println();
		}//바깥쪽 for문끝
		System.out.println(sum);
		avg = (double)sum/cnt;
		System.out.println(avg);
		
	}//main메소드 끝
}
