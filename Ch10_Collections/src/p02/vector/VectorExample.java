package p02.vector;

import java.util.List;
import java.util.Vector;

/**[List 컬렉션]
 * Vector
 * -.Vector: List의 구현체
 *  .thread-safe: multiThread환경에 안전한 자료구조
 **/
public class VectorExample {
	public static void main(String[] args) {
		//Vector로 List객체 생성
		List<Board> list = new Vector<>();
		//add(객체): 추가
		for(int i = 1; i<10; i++) {
			list.add(new Board("제목"+i,"내용"+i,"작성자"+i));	
		}
		System.out.println("저장된 객체의 갯수: " +list.size());
		//remove(index): 삭제 
		list.remove(2);
		list.remove(3);
		//get(index): 검색
		for(int i = 0; i<list.size();i++) {
			System.out.println(list.get(i));
//			System.out.println(list.get(i).toString()); //뒤에 toString()이 있으나 없으나 같음
			//객체가 print(객체)문의 매개변수로 전달되면 객체의 toString()메소드가 자동 호출됨
		}
		
	}
}

class Board{
	//필드
	String title;
	String content;
	String writer;
	//생성자
	public Board(String title, String content, String writer) {
		this.title = title;
		this.content = content;
		this.writer = writer;
	}
	@Override
	public String toString() { 
		return title+"\t"+content+"\t"+writer;
	}
	
}
