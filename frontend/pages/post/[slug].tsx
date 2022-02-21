import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import {sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import { useForm, SubmitHandler } from 'react-hook-form';
import { stringify } from 'querystring';
import { useState } from 'react';

interface IFormInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

interface Props {
    post: Post;
}

function Post({ post }: Props) {
  
  const [submitted, setSubmitted ] =  useState(false)
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
      console.log('data', data)
      await fetch('/api/createComment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: stringify(data),
      }).then(() =>{
          console.log('data submitted:',data)
          setSubmitted(true)
      }).catch((err) => {
          console.error('error with onSubmit:' + err)
          setSubmitted(false)
      })
  }
  const {
      register, 
      handleSubmit,
      formState: { errors },
  } = useForm<IFormInput>();

  return <main>
      <Header />
      <img 
        className='w-full h-40 object-cover'
        src={urlFor(post.mainImage).url()!} 
        alt='main-img'
      />
      <article className='max-w-3xl max-auto p-5'>
          <h1 className='text-3xl mt-10 mb-3'>
              {post.title}
          </h1>
          <h2 
            className='text-xl font-light text-gray-500 mb-2'>
            {post.description}
          </h2>
          <div className='flex items-center space-x-3'>
          <img
            className='h-10 w-10 rounded-full'
            src={urlFor(post.author.image).url()!}
            alt='author-pic'
          />
          <p className='text-extralight text-sm'>
              Blog post by <span className='text-green-600'>{post.author.name}</span> - Publised at {new Date(post._createdAt).toLocaleString()}
          </p>
          </div>
          <div>
              <PortableText
                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                content={post.body}
                serializers={
                    {
                        h1: (props: any) => (
                            <h1 className='text-2xl font-bold my-5' {...props}/>
                        ),
                        h2: (props: any) => (
                            <h2 className='text-xl font-bold my-5' {...props}/>
                        ),
                        li: ({ children }: any) => (
                            <li className='ml-4 list-disc'>{children}</li>
                        ),
                        link: ({ href, children }: any) => (
                            <a href={href} className='text-blue-500 hover:underline'>
                                {children}
                            </a>
                        )

                    }
                }
              />
          </div>
      </article>

      <hr className='mx-w-lg my-5 mx-auto border border-yellow-500'/>

      {submitted? (
          <div className='flex flex-col py-10 my-10 bg-yellow-500 text-white
          max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold'>Thank you for your comment!</h1>
            <h2>Once it has approved, it will appear below!!</h2>

          </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}className='flex flex-col p-5 max-w-2xl mx-auto mb-10'>
        <h3 className='text-sm text-yellow-500'>Enjoyed this article?</h3>
        <h4 className='text-3xl font-blod'>Leave a comment below!</h4>
        <hr className='py-3 mt-2'></hr>

        <input
          {...register("_id")}
          type='hidden'
          name='_id'
          value={post._id}
        />
        <label className='block mb-5'>
            <span className='text-gray-700 '  >Name</span>
            <input 
              {...register("name", {required: true})}
              className='shadow border rounded px-3 py-2 form-input mt-1
              block w-full ring-yellow-500 focus:ring'
              placeholder='Jon wick' type='text'></input>
        </label>
        <label className='block mb-5' >
            <span>Email</span>
            <input 
              {...register("email", {required: true})}
              className='shadow border rounded px-3 py-2 form-input mt-1
              block w-full ring-yellow-500 focus:ring'
              placeholder='Jon wick' type='text'></input>
        </label> 
        <label className='block mb-5' >
              <span>Comment</span>
              <textarea 
                {...register("comment", {required: true})}
                className='shadow border rounded px-2 py-3 form-text-area w-full
                mt-1 block ring-yellow-500 outline-none focus:ring'
                placeholder='Please leave us some comment!' rows={8}></textarea>
          </label>      
          
          <div className='flex flex-col p-5'>
              {errors.name && (
                  <span className='text-red-500'>The Name Field is required.</span>
              )}
              {errors.email && (
                  <span className='text-red-500'>The Email Field is required.</span>
              )}
              {errors.comment && (
                <span className='text-red-500'>The Comment Field is required.</span>
            )}
          </div>
          <input 
            type='submit'
            className='shadow bg-yellow-500 
            hover:bg-yellow-400 focus:shadow-outline
            focus:outline-none text-white font-bold py-2
            px-4 rounded cursor-pointer'
          />
      </form>
      )
    } 
    <div className='flex flex-col p-10 my-10 max-w-2xl max-auto 
    shadow-yellow-500 shadow space-y-2'>
        <h3 className='text-4xl'>Comments</h3>
        <hr className='pb-2'/>
        {post.comments.map((comment) => (
            <div key={comment._id}>
                <p>
                    <span className='text-yellow-500'>{comment.name}:</span>
                    {comment.comment}
                </p>
            </div>
        ))}
        
    </div>
  </main>
}

export default Post;


export const getStaticPaths = async () => {
    const query = `*[_type == "post"] {
      _id,
      slug {
          current
        }
      }`;
    
    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
        params:{
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback:'blocking'
    }

}

export const getStaticProps: GetStaticProps =async ({ params }) => {
    const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        body,
        author-> {
        name,
        image
      },
      'comments': *[
          _type == "comment" &&
          post._ref == ^._id &&
          approved == true],
      description,
      mainImage,
      slug
      }`;
      const post = await sanityClient.fetch(query, {
          slug: params?.slug,
      })

      if (!post) {
          return {
              notFound: true
          }
      }
      return {
          props: {
              post,
          },
          revalidate: 60, 
      }
    
}

